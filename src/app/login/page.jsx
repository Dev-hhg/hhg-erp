'use client';
import { useState, useEffect, useContext } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { lastLogin, getAllUsers } from '@/serverComponents/dbFunctions';
import parser from 'ua-parser-js';
import { VendorContext } from '@/app/Context/vendorcontext';

function Page() {
  const { data: session, status } = useSession();
  const { setIsLogged } = useContext(VendorContext);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [ip, setIp] = useState('');
  const [geo, setGeo] = useState('');
  const [result, setResult] = useState({});

  useEffect(() => {
    const fetchIP = fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        setIp(data.ip);
        return data.ip;
      })
      .then((devip) => {
        return fetch(`https://ipapi.co/${devip}/json/`);
      })
      .then((res) => res.json())
      .then((data) => {
        setGeo(data);
      })
      .catch((e) => {
        console.log(e);
      });

    const res = parser(window.navigator.userAgent);
    setResult(res);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllUsers();
      setUsers(res);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get('callbackUrl') || '/entry';
      console.log('Redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (e.target.username.value === '' || e.target.password.value === '') {
      window.alert('Fields are empty!');
      return;
    }
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get('callbackUrl') || '/entry';

      console.log('Callback URL before signIn:', callbackUrl);

      const res = await signIn('credentials', {
        username: e.target.elements.username.value,
        password: e.target.elements.password.value,
        redirect: false,
        callbackUrl: callbackUrl,
      });

      console.log('SignIn response:', res);

      if (res.error) {
        window.alert('There was an error signing in!');
        return;
      }

      const device =
        result?.device?.type +
        ' ' +
        result?.os?.name +
        ' ' +
        result?.browser?.name;
      const date = new Date();
      const time = date.toLocaleTimeString('en-IN');

      const devInfo = `${device}, Date: ${date.toLocaleDateString(
        'en-IN'
      )}, Time: ${time} IP: ${ip}, City: ${geo?.city}, Postal: ${
        geo?.postal
      }, Latitude: ${geo?.latitude}, Longitude: ${geo?.longitude}`;

      await lastLogin({
        user_id: e.target.elements.username.value,
        device: devInfo,
      });

      window.alert('Login Successful! Welcome');
      setIsLogged(true);

      // Manual redirection
      console.log('Manually redirecting to:', callbackUrl);
      router.push(callbackUrl);
    } catch (error) {
      window.alert(error);
    }
  }

  const userOptions = users.map((user, index) => (
    <option key={index} value={user.username}>
      {user.username}
    </option>
  ));

  return (
    <div className="m-4 flex flex-col items-center justify-center">
      <div className="flex w-1/2 flex-col items-center">
        <h1 className="mb-4 text-3xl font-bold text-white">Login</h1>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center justify-center"
        >
          <select
            name="username"
            className="mb-4 w-full rounded-md border-2 border-gray-300 px-4 py-2"
            required
          >
            <option value="">Select User</option>
            {userOptions}
          </select>

          <input
            type="password"
            placeholder="Password"
            name="password"
            className="mb-4 w-full rounded-md border-2 border-gray-300 px-4 py-2"
            required
          />

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Page;
