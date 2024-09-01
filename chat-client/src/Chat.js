import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('');

    useEffect(() => {
        console.log('Setting up SignalR connection...');

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5197/chathub')
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        const startConnection = async () => {
            console.log('Attempting to start connection...');
            try {
                await newConnection.start();
                console.log('SignalR Connected.');
            } catch (err) {
                console.error('SignalR Connection Error: ', err);
                setTimeout(startConnection, 5000);
            }
        };

        newConnection.onclose(async () => {
            console.log('Connection closed, attempting to reconnect...');
            await startConnection();
        });

        // Add message handler
        console.log('Adding ReceiveMessage handler...');
        newConnection.on('ReceiveMessage', (user, message) => {
            console.log('Received message:', user, message);
            setMessages((messages) => [...messages, { user, message }]);
        });

        startConnection();

        return () => {
            console.log('Cleaning up connection...');
            newConnection.stop();
        };
    }, []);

    const handleSendMessage = async () => {
        if (connection) {
            try {
                await connection.send('SendMessage', user, message);
                setMessage('');
            } catch (err) {
                console.error('Error sending message: ', err);
            }
        }
    };

    return (
        <div>
            <div>
                <h2>Chat</h2>
                <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Enter your name"
                />
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
            <div>
                <h3>Messages:</h3>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}><strong>{msg.user}:</strong> {msg.message}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Chat;
