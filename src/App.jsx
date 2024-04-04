import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  BrowserRouter,
  Routes,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from './Root.jsx';
import Streaming from "./pages/Streaming.jsx";
import Static from "./pages/Static.jsx";
import './App.css'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      //every other route goes here
      <Route path="/streaming" element={<Streaming/>}/>
      <Route path="/static" element={<Static/>}/>
    </Route>
      ))
      
      function App() {
  return <RouterProvider router={router} />;
}

export default App
