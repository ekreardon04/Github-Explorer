import { useState} from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchGithubUser } from "../api/github";
import UserCard from "./UserCard";

const UserSearch = () => {

const [username, setUsername] = useState("")
const [submittedUserName, setSubmittedUserName] = useState("")


const {data, isLoading, isError, error} = useQuery({
    queryKey: ['users', submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName
})

const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmittedUserName(username.trim())
}

    return ( <>
    <form onSubmit={handleSubmit} className="form">
        <input
        type="text"
        placeholder="Enter Github Username..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
        <button type= "submit">Search</button>
    </form>
    {isLoading && <p className="status">Loading...</p>}
      {isError && <p className="status error">{error.message}</p>}
      {data && (
        <UserCard user={data}/>
      )}
    </> );
}
 
export default UserSearch;