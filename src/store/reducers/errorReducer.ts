const initialState = {
  isLoading: false,
  errorMessage: null,
  categoryLoader: false,
  btnLoader:false,
};
export const errorReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case "IS_FETCHING":
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
      };

    case "IS_SUCSESS":
      return {
        ...state,
        isLoading: false,
        errorMessage: null,
      };
    case "IS_ERROR":
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
      };
    case "POST_FECTHING":
      return {
        ...state,
        categoryLoader: true,
        categoryError: null,
      };
    case "POST_SUCSESS":
      return {
        ...state,
        categoryLoader: false,
        errorMessage: null,
      };
     case "BTN_LOADER":
     return {
       ...state,
       btnloader:false
     }

    default:
      return state;
  }
};
