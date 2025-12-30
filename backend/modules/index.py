import json
import os
import psycopg2
import jwt

def verify_token(token: str) -> dict:
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
    '''API для управления модулями платформы'''
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
            cursor.execute("""
                SELECT id, name, icon, is_premium, is_active, allowed_roles, owner_id
                FROM modules
                WHERE owner_id = %s OR %s = ANY(allowed_roles)
                ORDER BY created_at DESC
            """, (user_data['user_id'], user_data['role']))
            
            modules = []
            for row in cursor.fetchall():
                modules.append({
                    'id': str(row[0]),
                    'name': row[1],
                    'icon': row[2],
                    'isPremium': row[3],
                    'isActive': row[4],
                    'allowedRoles': row[5],
                    'ownerId': row[6]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'modules': modules}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            if user_data['role'] != 'owner':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Only owner can create modules'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute("""
                INSERT INTO modules (name, icon, is_premium, is_active, allowed_roles, owner_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                body['name'],
                body['icon'],
                body.get('isPremium', False),
                body.get('isActive', True),
                body['allowedRoles'],
                user_data['user_id']
            ))
            
            module_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Module created', 'id': str(module_id)}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            if user_data['role'] != 'owner':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Only owner can update modules'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            module_id = body.get('id')
            
            cursor.execute("""
                UPDATE modules
                SET name = %s, icon = %s, is_premium = %s, is_active = %s, 
                    allowed_roles = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND owner_id = %s
            """, (
                body['name'],
                body['icon'],
                body.get('isPremium', False),
                body.get('isActive', True),
                body['allowedRoles'],
                module_id,
                user_data['user_id']
            ))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Module updated'}),
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
