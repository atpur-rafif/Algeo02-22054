import { ArrowLeftCircleIcon } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <img className="max-w-[50vw] max-h-[50vh]" src="/cukurukuk.gif" />
      <p>Cukurukuk, cuman ada ayam disini</p>
      <a href="/" className="flex mt-2 pb-1 flex-row gap-2 transition-all border-b-2 border-opacity-0 hover:border-opacity-100 border-black justify-center items-center">
        <ArrowLeftCircleIcon />
        <p>Sini, balik kuy</p>
      </a>
    </div>
  );
}