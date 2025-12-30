import json
import os
import psycopg2
import bcrypt
import jwt
from datetime import datetime, timedelta

def handler(event: dict, context) -> dict:
    '''API для аутентификации и управления пользователями'''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cursor = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                email = body.get('email')
                password = body.get('password')
                
                cursor.execute(
                    "SELECT id, password_hash, role FROM users WHERE email = %s",
                    (email,)
                )
                user = cursor.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
                
                user_id, password_hash, role = user
                
                if bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
                    token = jwt.encode(
                        {
                            'user_id': user_id,
                            'role': role,
                            'exp': datetime.utcnow() + timedelta(days=7)
                        },
                        os.environ.get('JWT_SECRET', 'starry-sky-secret-key'),
                        algorithm='HS256'
                    )
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'token': token,
                            'user': {'id': user_id, 'email': email, 'role': role}
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid credentials'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'register':
                email = body.get('email')
                password = body.get('password')
                role = body.get('role', 'user')
                
                password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                try:
                    cursor.execute(
                        "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s) RETURNING id",
                        (email, password_hash, role)
                    )
                    user_id = cursor.fetchone()[0]
                    conn.commit()
                    
                    return {
                        'statusCode': 201,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'message': 'User created',
                            'user': {'id': user_id, 'email': email, 'role': role}
                        }),
                        'isBase64Encoded': False
                    }
                except psycopg2.IntegrityError as e:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User already exists'}),
                        'isBase64Encoded': False
                    }
                except Exception as e:
                    conn.rollback()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Registration failed'}),
                        'isBase64Encoded': False
                    }
        
        elif method == 'GET':
            token = event.get('headers', {}).get('X-Auth-Token')
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No token provided'}),
                    'isBase64Encoded': False
                }
            
            try:
                payload = jwt.decode(
                    token,
                    os.environ.get('JWT_SECRET', 'starry-sky-secret-key'),
                    algorithms=['HS256']
                )
                
                cursor.execute(
                    "SELECT id, email, role FROM users WHERE id = %s",
                    (payload['user_id'],)
                )
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'user': {'id': user[0], 'email': user[1], 'role': user[2]}
                        }),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
            except jwt.ExpiredSignatureError:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Token expired'}),
                    'isBase64Encoded': False
                }
            except jwt.InvalidTokenError:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid token'}),
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