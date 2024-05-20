import "./Conversation.css"
import Helpers from "../helpers";

function Conversation(data: Conversation) {

    function getMarkdownText(text: string) {
        const temp = document.createElement("div");
        temp.innerHTML = marked(text);
        const linkElements = temp.querySelectorAll("a");
        if (linkElements) {
            for (const element of linkElements) {
                element.setAttribute("target", "_blank");
            }
        }
        return temp.innerHTML;
    }

    function getFormattedDate(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDay();
        const hour = date.getHours();

        return `${year}/${month}/${day}, ${hour} h.`
    }

    return (
        <div className="chatbot">
            <header>
                <h2>Conversation date: {getFormattedDate(new Date(data.lastSaved))}; Rating: {Helpers.convertRatingToString(data.chatRating)}</h2>
            </header>
            <ul className="chatbox">
                <li className="chat incoming">
                    <div className="chatbot-profile-container">
                        <span className="material-symbols-outlined">
                            smart_toy
                        </span>
                    </div>
                    <div>
                        <p>Hi there 👋<br />How can I help you today?</p>
                    </div>
                </li>
                {
                    data.conversation.map((message, index) => (
                        <li key={index} className={message.message.role == "assistant" || message.message.role == "system" ? "chat incoming" : "chat outgoing"}>
                            {message.message.role === "assistant" || message.message.role == "system" ?
                                <div className="chatbot-profile-container">
                                    <span className="material-symbols-outlined">
                                        smart_toy
                                    </span>
                                </div>
                                : ""}
                            <div dangerouslySetInnerHTML={{ __html: getMarkdownText(message.message.content) }}>
                                {/* HTML content will be rendered here */}
                            </div>
                        </li>
                    ))
                }
            </ul>
            {
                data.dislikeFeedback && ((
                    <div className="dislike-feedback">
                        <p>Dislike feedback: {data.dislikeFeedback}</p>
                    </div>
                ))
            }
        </div >
    );
}

export default Conversation;