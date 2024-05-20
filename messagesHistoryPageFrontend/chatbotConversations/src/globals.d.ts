declare global {
    declare type Conversation = {
        UserId: string,
        chatRating: number | null,
        conversation: Message[],
        EVERYTHING: string,
        lastSaved: string,
        dislikeFeedback: string | null,
    };
    
    declare type Message = {
        message: InnerMessage,
        time: Date
    }

    declare type InnerMessage = {
        content: string,
        role: Role
    }

    type Role = "user" | "assistant" | "system"
}

export {};