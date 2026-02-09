import { Outlet } from "react-router";

function App() {
  return (
    <div className="container min-h-dvh mx-auto flex">
      <Outlet />
    </div>
  );
}

export default App;
