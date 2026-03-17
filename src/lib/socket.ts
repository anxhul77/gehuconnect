import { Client } from "@stomp/stompjs"

let stompClient: Client | null = null

export const setStompClient = (client: Client) => {
  stompClient = client
}

export const getStompClient = () => stompClient