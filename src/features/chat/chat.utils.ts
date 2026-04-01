export const mergeMessage=(draft,data)=>{

const index=
draft.messages.findIndex(

m=>m.clientId===data.clientId
)

if(index!==-1){

draft.messages[index]=data

}else{

draft.messages.push(data)

}

}