/* event id 
id 1= in
id 2= out
id 19 = draw
*/ let socket; // Declare socket variable to avoid multiple instances




// Listen for toggle message from background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'toggle') {
        if (message.enabled) {
            // If enabled (ON), initiate the WebSocket connection
            if (!socket || socket.readyState === WebSocket.CLOSED) {
                console.log("Extension is ON, establishing WebSocket connection...");
                initiateWebSocketConnection();
            }
        } else {
            // If disabled (OFF), close the WebSocket connection if it exists
            if (socket && socket.readyState === WebSocket.OPEN) {
                console.log("Extension is OFF, closing WebSocket connection...");
                socket.close();
                console.log("closed socket")
            }
        }
    }
});

// Function to initiate WebSocket connection
function initiateWebSocketConnection() {
    socket = new WebSocket("wss://server3.skribbl.io/5005/?EIO=4&transport=websocket");

    socket.onopen = () => {
        console.log("Connected to WebSocket.");
    };

    socket.onerror = (error) => {
        console.log('WebSocket Error:', error);
    };

    socket.onmessage = (event) => {
        if (event.data.startsWith('0')) {
            socket.send('40');
        }
        /*if (event.data.startsWith('40')) {
            socket.send('42["login",{"join":"M9C7kssq","create":0,"name":"namename","lang":"0","avatar":[0,11,47,-1]}]'); 
        }*/
        if (event.data.startsWith('40')) {
                let roomId = "";//prompt("Enter the Room ID to connect:");
                const action = 1
                const payload = JSON.stringify(["login", {
                    join: roomId,
                    create: action,
                    name: "testtesttest",
                    lang: "0",
                    avatar: [0, 11, 47, -1]
                }]);
                socket.send(`42${payload}`);
            }    
        if (event.data === '2') {
            console.log('Received 2, sending 3');
            socket.send('3');  // Send 3 back to the server
        }


        
        if (event.data.startsWith("42")) {
            const parsedData = JSON.parse(event.data.slice(2)); // Remove the "42" prefix
            const eventName = parsedData[0];
            const eventData = parsedData[1];

            if (eventName === "data" && eventData.id === 1) {
                const newPlayer = eventData.data;
                const playerId = newPlayer.id;
                const playerName = newPlayer.name;

                console.log(`New player joined: ${playerName} (ID: ${playerId})`);

                // Send a message to background.js for notification
                chrome.runtime.sendMessage({
                    type: 'joined',
                    playerId,
                    playerName
                });
            }

            if(eventData.id===10 && eventName==="data")
            {
                    
                    const serverLink=`https://skribbl.io/?${eventData.data.id}`
                    console.log(serverLink)
                    chrome.runtime.sendMessage({
                        type: 'serverLink',
                        link: serverLink
                    });
                    
            }

           /* if (eventName === "data" && (eventData.id === 2 || eventData.id === 13)) {//left or kicked
                
                const Player = eventData.data;
                const playerId = Player.id;
                const playerName = Player.name;
                console.log(`Player left: ${playerName}`);

                // Send a message to background.js for notification
                chrome.runtime.sendMessage({
                    type: 'left',
                    playerId,
                    playerName

                });
            }*/
        }
    };
}