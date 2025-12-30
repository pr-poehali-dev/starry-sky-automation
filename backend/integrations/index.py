import json
import os
import psycopg2
import jwt
from typing import Optional

def verify_token(token: str) -> Optional[dict]:
    '''Проверка JWT токена'''
    try:
        payload = jwt.decode(
            token,
            os.environ.get('JWT_SECRET', 'starry-sky-secret-key'),
            algorithms=['HS256']
        )
        return payload
    except:
        return None

def handler(event: dict, context) -> dict:
    '''API для управления интеграциями с внешними сервисами'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    token = event.get('headers', {}).get('X-Auth-Token')
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'}),
            'isBase64Encoded': False
        }
    
    user_data = verify_token(token)
    if not user_data:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        if method == 'GET':
            service = event.get('queryStringParameters', {}).get('service')
            
            if service:
                cursor.execute("""
                    SELECT id, service_name, api_key, webhook_url, settings, is_active
                    FROM integrations
                    WHERE user_id = %s AND service_name = %s
                """, (user_data['user_id'], service))
                
                row = cursor.fetchone()
                if row:
                    integration = {
                        'id': row[0],
                        'service': row[1],
                        'hasApiKey': bool(row[2]),
                        'webhookUrl': row[3],
                        'settings': row[4],
                        'isActive': row[5]
                    }
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'integration': integration}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Integration not found'}),
                        'isBase64Encoded': False
                    }
            else:
                cursor.execute("""
                    SELECT id, service_name, webhook_url, settings, is_active
                    FROM integrations
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                """, (user_data['user_id'],))
                
                integrations = []
                for row in cursor.fetchall():
                    integrations.append({
                        'id': row[0],
                        'service': row[1],
                        'webhookUrl': row[2],
                        'settings': row[3],
                        'isActive': row[4]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'integrations': integrations}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO integrations 
                (user_id, service_name, api_key, webhook_url, settings, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_data['user_id'],
                body['service'],
                body.get('apiKey'),
                body.get('webhookUrl'),
                json.dumps(body.get('settings', {})),
                body.get('isActive', True)
            ))
            
            integration_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Integration created',
                    'id': integration_id
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            integration_id = body.get('id')
            
            cursor.execute("""
                UPDATE integrations
                SET api_key = COALESCE(%s, api_key),
                    webhook_url = COALESCE(%s, webhook_url),
                    settings = COALESCE(%s, settings),
                    is_active = COALESCE(%s, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """, (
                body.get('apiKey'),
                body.get('webhookUrl'),
                json.dumps(body.get('settings')) if body.get('settings') else None,
                body.get('isActive'),
                integration_id,
                user_data['user_id']
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Integration updated'}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
