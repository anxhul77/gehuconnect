const initialState={
    userId:null,
    username:null,
    profile:null,

}

export default function authReducer(state:any=initialState,action:any){
     switch(action.type){
        case "LOGIN_USER":{
            return {...state,user : action.payload}
        }
        case "LOGOUT_USER":
         return {...state }

        default : return state
    }
}