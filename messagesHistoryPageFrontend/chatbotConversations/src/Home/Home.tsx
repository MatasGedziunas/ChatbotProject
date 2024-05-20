import React, { useState } from "react";
import "./Home.css";
import Conversation from "../Conversation/Conversation";

function Home() {

    // const [dateFrom, setDateFrom] = useState();
    // const [dateTo, setDateTo] = useState(() => {
    //     const date = new Date();
    //     date.setDate(date.getDate() + 7);  // Adds 7 days to the current date
    //     return date;
    // });
    // const [rating, setRating] = useState("Any");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [responseMessage, setResponseMessage] = useState("");


    const getFormattedDateOneWeekAgo = () => {
        const date = new Date(); // Gets today's date
        date.setDate(date.getDate() - 7); // Subtracts 7 days
        const year = date.getFullYear(); // YYYY
        const month = date.getMonth() + 1; // MM (getMonth() returns 0-11)
        const day = date.getDate(); // DD
        const formattedMonth = month < 10 ? `0${month}` : month;
        const formattedDay = day < 10 ? `0${day}` : day;
        return `${year}-${formattedMonth}-${formattedDay}`; // Formats date in 'YYYY-MM-DD'
    };
    async function handleFiltering(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setResponseMessage("Loading data...");
        const url = new URL("https://fkbw06fjz2.execute-api.us-east-1.amazonaws.com/production/getConversations");
        const formData = new FormData(event.currentTarget);
        formData.forEach((value, key) => {
            if (value) {  // Ensure the value is not empty
                url.searchParams.append(key, value as string);
            }
        });
        try {
            const response = await fetch(url.toString(), {
                method: "GET", // GET request, do not include body
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            console.log(data);  // Log the fetched data
            const responseConversations = data.data.sort((a: Conversation, b: Conversation) => a.lastSaved > b.lastSaved);
            setConversations(responseConversations as Conversation[]);
            setResponseMessage(data.message);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="homeContainer">
            <div className="filtering">
                <h1>Search for conversations</h1>
                <form onSubmit={handleFiltering} className="filteringParameterSelection">
                    <label htmlFor="dateFrom">From: </label>
                    <input type="date" name="dateFrom" id="dateFrom" defaultValue={getFormattedDateOneWeekAgo()} />
                    <label htmlFor="chatRating">Conversation rating: </label>
                    <select name="chatRating" id="chatRating">
                        <option value="Any">Any</option>
                        <option value="Liked">Liked</option>
                        <option value="Disliked">Disliked</option>
                        <option value="Unrated">Unrated</option>
                    </select>
                    <label htmlFor="dateFrom">Count: </label>
                    <input type="number" name="limit" id="limit" defaultValue={10}></input>
                    <button type="submit">Search</button>
                </form>
            </div>
            <div className="responseMessageContainer">
                <p className={responseMessage ? "with-content" : ""}>
                    {responseMessage}
                </p>
            </div>
            <div className="conversationsContainer">
                {conversations ?
                    conversations.map((conversation) => (
                        Conversation(conversation)
                    )) : <p>No conversations to display.</p>
                }
            </div>
        </div>
    );
}

export default Home;
