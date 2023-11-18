import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError() as any;

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <img className="max-w-[50vw] max-h-[50vh]" src="/cukurukuk.gif" />
      <p>Cukurukuk, ngak ada apa apa disini</p>
    </div>
  );
}