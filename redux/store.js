import { legacy_createStore as createStore } from "redux";
const intialState = {
  data: [],
};

const rootReducer = (state = intialState, action) => {
  switch (action.type) {
    case "GET_EDITOR_DATA":
      return {
        ...state,
        data: action.payload,
      };
    default:
      return state;
  }
};

export default createStore(rootReducer);
