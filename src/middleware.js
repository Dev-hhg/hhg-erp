export { default } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    '/addfarmer',
    '/addvendor',
    '/advance',
    '/createUser',
    '/dailybook',
    '/editvendor',
    '/entry',
    '/extra',
    '/findfarmer',
    '/lateentry',
    '/latememo',
    '/memo',
    '/payment',
    '/print/:path*',
    '/reports',
    '/reports1',
    '/scan',
    '/transportmemo',
    '/vendorMemo',
    '/viewentries',
    '/viewfarmers',
    '/viewpayment',
    '/vmdata',
    '/findfarmer/:path*',
  ],
};
