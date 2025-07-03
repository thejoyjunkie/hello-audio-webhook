// This is our helper program that connects Hello Audio and MailerLite

exports.handler = async (event, context) => {
    // Check if someone sent us information
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the information that was sent to us
        const data = JSON.parse(event.body);
        console.log('Received data from Hello Audio:', data);
        
        const email = data.email;
        const episode = data.episode;
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';

        console.log('Parsed values:', { email, episode, firstName, lastName });

        // Your MailerLite secret password (API key) goes here
        const MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMTI4OTBlNzdlOWMyMDMwM2VjZmE1N2VlMTMzZTk3NWI0NmZhYTM5NWExMGI5YzEwZTZjNDk1YzFkNjc1Y2E3NTI0NDVjODBmYzdjODVjNTYiLCJpYXQiOjE3NTEwNDg1MTAuNjk3OTg0LCJuYmYiOjE3NTEwNDg1MTAuNjk3OTg3LCJleHAiOjQ5MDY3MjIxMTAuNjkyNzkzLCJzdWIiOiIxNDA5ODQ5Iiwic2NvcGVzIjpbXX0.mAqiGcnwD7RVexE42XGb1sU3X328jetcisu9PSeCUOKRJe_-lEqq4LY9U-Y697mIAOxFj5g6SVuhAGXtvqnS7TuCjb_QtIsiEC_2H5fXkzhVuAHGPQAJ7pQSMS8mPUqAhDF4NP5WJdVK8Gi5rxgky5jqyBaKPIceeEOrCjKBe4JciKqhNbKhqHhKgUqOLEoor_Y1LGnjmYnr2HmvunLsCrAGqyvKewbqTcoaFwKB2ubunijYTFNhX4EIak-jjwWOkLCuJAKoZSedGodSNwOYFw8Jr9dKzpIPbAolYaX2mvL6sg9ZlWBX65AKBDXgjQ92_8wJ4IyT7nQHkODZcjiFgWFWC1BD6_GIOOr6cvXmqBiZNZ6gFGBPy4Pk7ux6nxnNidtDj3c6UR_XfNL1MhC1sU9LHfI1UrzQywyE5MppSNtzrYugwB0NEnYG9cwlrcMfpNp4Y6OuKInBCuyRkDrr9zRchjn3jc6YKfWersa9tnoFHtwlrzpNAi63sSJDCxU3ijTswfdwEXqiiTfvey1ONtAlNYdOHo2yAf5-5fJ6Fk4fKBmke0V4SpT7MJttrNwCF9iyuDnejBBK5Vv7HWdqtQkFWmHn-t-r6ToyuxK6EHmANJrHuBSi3w15xxS0VJVId3gYjvzWiPtE9EbNPXR_nS5n_X3EX0g9GUUb7xjruvI';

        // Add person to MailerLite main group
        console.log('Attempting to add to main group: BOD FREE Pod Series');
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fields: {
                    name: firstName,
                    last_name: lastName
                },
                groups: ['BOD FREE Pod Series'] // Your main group name
            })
        });

        console.log('MailerLite main group response status:', response.status);
        const responseText = await response.text();
        console.log('MailerLite main group response:', responseText);

        // If someone completed an episode, add them to that episode's group
        if (episode) {
            const episodeGroup = `BOB Episode ${episode} Completed`;
            console.log('Attempting to add to episode group:', episodeGroup);
            
            const groupResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    groups: [episodeGroup]
                })
            });

            console.log('MailerLite episode group response status:', groupResponse.status);
            const groupResponseText = await groupResponse.text();
            console.log('MailerLite episode group response:', groupResponseText);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success!' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong' })
        };
    }
};
