# Simple Painting Store Chatbot

Hello! I am the chatbot developer for Simple Painting Store. Welcome to the repository for a chatbot project. This repository contains the code necessary to run our chatbot, which is connected to the ChatGPT API.

# Preview

It is possible to preview the application with this link: [https://j0mfnkb1fj.execute-api.us-east-1.amazonaws.com/](https://j0mfnkb1fj.execute-api.us-east-1.amazonaws.com/)

## Developer Information
- **GitHub Name:** MatasGedziunas
- **Repository Owner:** MatasGedziunas

## Project Overview

This project is designed to provide an interactive chatbot experience for users visiting the Simple Painting Store. The chatbot is built using HTML, CSS, and JavaScript, and it communicates with the ChatGPT API to provide intelligent responses to user queries.

## File Hosting

The following files are hosted on AWS S3:
- `chatbot.html`
- `styles.css`
- `script.js`
- `instructions.txt`

## How It Works

1. **Opening the Chatbot Interface:** 
   - The user can open the chatbot interface by clicking the chatbot icon on the website.
   
2. **Establishing Connection:**
   - When the user clicks the chatbot icon, a WebSocket connection is established with our backend API.

3. **User Interaction:**
   - When a user inputs text, the message is sent through the WebSocket connection to the ChatGPT API.
   - The response from the ChatGPT API is streamed back to the backend and then to the frontend, creating a seamless conversation flow.
   
4. **System Message:**
   - The system message, which includes information that ChatGPT should know, is contained in the `instructions.txt` file.
   
5. **Message Storage:**
   - Each message is saved in `localStorage`. We might switch this to IndexedDB in the future.
   - Whenever the user opens the chatbot, a unique identifier is generated and stored in `localStorage`.

6. **User Feedback:**
   - When a user closes the chatbot, they are prompted with a like or dislike screen to rate their experience.
   - The conversation information, along with the rating and feedback, is then saved in our database.

7. **Conversation History:**
   - A website has been created where we can view all the conversations that have taken place.

## Repository Structure

- **DBsaving:** Contains code for saving data to the database.
- **GPTmessageEndpoint:** Contains the endpoint for handling messages to and from the ChatGPT API.
- **getConversations:** Code to retrieve conversation history.
- **iframeEndpoint:** Handles the iframe for embedding the chatbot.
- **local:** Contains local development configurations.
- **messagesHistoryPageFrontend:** Code for the frontend to see the conversations that users have had.
- **.gitignore:** Git ignore file configuration.

