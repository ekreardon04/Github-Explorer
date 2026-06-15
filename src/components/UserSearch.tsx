import { useState, useEffect} from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import RecentSearches from "./RecentSearches";

const UserSearch = () => {

const [username, setUsername] = useState("")
const [submittedUserName, setSubmittedUserName] = useState("")
const [recentUsers, setRecentUsers] = useState<string[]>(() => {
  const stored = localStorage.getItem("recentUsers")
  return stored ? JSON.parse(stored) : []
})


const {data, isLoading, isError, error} = useQuery({
    queryKey: ['users', submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName
})

const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = username.trim()
    if(!trimmed) return
    setSubmittedUserName(trimmed)
    setUsername("")

    setRecentUsers((prev) => {
      const updated = [trimmed, ...prev.filter((user) => user !== trimmed)]
      return updated.slice(0, 5)
    })
}

useEffect(() => {
  localStorage.setItem('recentUsers', JSON.stringify(recentUsers))
}, [recentUsers])

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
         {recentUsers.length > 0 && (
        <RecentSearches 
        users = {recentUsers} 
        onSelect={(username) =>  {
          setUsername(username) 
          setSubmittedUserName(username)

        }} />
        )}
    </> );
}
 
export default UserSearch;