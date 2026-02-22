import { Link } from "react-router";

function NotFound() {
  return (
    <div className="flex items-center w-full flex-col justify-center">
      <div className="min-w-full text-center mb-10 font-bold">
        Page Not Found
      </div>
      <Link to={"/"} className="underline">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
