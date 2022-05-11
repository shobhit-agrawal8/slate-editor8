import React from "react";
import { useFocused, useSelected, useSlateStatic } from "slate-react";
import { removeLink } from "../../utils/link.js";
import unlink from "../../Toolbar/toolbarIcons/unlink.svg";
const Link = ({ attributes, element, children }) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  console.log("link.js");
  return (
    <div className="link">
      <a href={element.href} {...attributes} style={{color:"blue"}}>
        {children}
      </a>
      {selected && focused && (
        <div className="link-popup" contentEditable="false" style={{color:"blue"}}>
          <a href={element.href}>{element.href}</a>
          <button onClick={() => removeLink(editor)}>
            <img src={unlink} alt="" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Link;
