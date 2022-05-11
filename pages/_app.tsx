import "../styles/globals.css";
import "../shared/SlateEditor/Elements/Color Picker/ColorPicker.css";
import "../shared/SlateEditor/Elements/Image/Image.css";
import "../shared/SlateEditor/Elements/Link/styles.css";
import "../shared/SlateEditor/Elements/Table/Table.css";
import "../shared/SlateEditor/Elements/Video/Video.css";
import "../shared/SlateEditor/Toolbar/styles.css";
import "../shared/SlateEditor/Editor.css";
import { Provider } from "react-redux";
import store from "../redux/store";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />;
    </Provider>
  );
}

export default MyApp;
