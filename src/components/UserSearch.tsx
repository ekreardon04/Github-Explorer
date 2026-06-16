import { useState, useEffect} from "react";
import { useQuery } from "@tanstack/react-query";
import SuggestionDropdown from "./SuggestionDropdown";
import { fetchGithubUser, searchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import RecentSearches from "./RecentSearches";
import { useDebounce } from "use-debounce";
import type { GithubUser } from "../types";

const UserSearch = () => {

const [username, setUsername] = useState("")
const [submittedUserName, setSubmittedUserName] = useState("")
const [recentUsers, setRecentUsers] = useState<string[]>(() => {
  const stored = localStorage.getItem("recentUsers")
  return stored ? JSON.parse(stored) : []
})

const [debouncedUsername] = useDebounce(username, 300)
const [showSuggestions, setShowSuggestions] = useState(false)


//query to fetch specific user
const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ['users', submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName,
})

//query to fetch suggestions for user search
const {data:suggestions} = useQuery({
    queryKey: ['github-user-suggestions', debouncedUsername],
    queryFn: () => searchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1,
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
      <div className="div dropdown-wrapper">
        <input
        type="text"
        placeholder="Enter Github Username..."
        value={username}
        onChange={(e) => {
          const val = e.target.value
          setUsername(val)
          setShowSuggestions(val.trim().length > 1)
        }
      }
        />
        {showSuggestions && suggestions?.length > 0 && (
<SuggestionDropdown suggestions={suggestions} show={showSuggestions} onSelect={( selected) => {
     
     setUsername(selected)
     setShowSuggestions(false)

     if(submittedUserName !== selected){
      setSubmittedUserName(selected)
     } else{
      refetch()
     }

    setRecentUsers((prev) => {
      const updated = [selected, ...prev.filter((u) => u !== selected)]
      return updated.slice(0, 5)
    })
}} />
      )}
        </div>
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