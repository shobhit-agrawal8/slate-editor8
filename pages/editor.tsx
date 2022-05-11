import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const SlateEditor = dynamic(() => import("../shared/SlateEditor/Editor"), {
  ssr: false,
});

const editor = () => {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    setMount(true);
  });
  return <>{mount && <SlateEditor />}</>;
};

export default editor;
