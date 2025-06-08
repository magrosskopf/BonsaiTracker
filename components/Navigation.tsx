import Link from 'next/link';

const Navigation = () => {
  return (
    <nav className="bg-gray-100 p-2 border-b border-gray-300 w-full">
      <ul className="list-none flex gap-4 m-0 p-0">
        <li className="text-base">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 transition-colors">
            Dashboard
          </Link>
        </li>
        <li className="text-base">
          <Link href="/create-bonsai" className="text-blue-500 hover:text-blue-700 transition-colors">
            Create Bonsai
          </Link>
        </li>
        <li className="text-base">
          <Link href="/profile" className="text-blue-500 hover:text-blue-700 transition-colors">
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
