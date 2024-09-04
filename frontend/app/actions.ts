'use server';

import { employeeLogin } from '@/api/Employees';
import { getToken, login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function handleLogin(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  //if (!email || !password) {
  //  throw new Error('Email and password are required');
  //}

  //const response = await employeeLogin(email, password);
  //console.log(response);

  await login('FAUX TOKEN');
  redirect('/');
}

export async function isLogin() {
  return getToken();
}
