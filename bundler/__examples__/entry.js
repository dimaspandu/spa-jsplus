import "./style.css";
import "./assets/logo.svg";
import { greetings } from "./message.js";
import { getUser, updateUser } from "./services/rpc.js";

console.log(greetings); 
const user = getUser("vegeta");
updateUser(user, "power", 120000000000);