import { cookies } from 'next/headers';

export async function login(token: string) {
  cookies().set('token', token);
}

export async function logout() {
  cookies().delete('token');
}

export function getToken() {
  const token = cookies().get('token');

  if (!token)
    return null;
  return token;
}
