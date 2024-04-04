import React from "react";
import { Outlet } from "react-router-dom";
import MenuBar from "./components/MenuBar.jsx";

const Root = () => {
  return (
    <>
      <MenuBar />
      <Outlet />
    </>
  );
};

export default Root;
