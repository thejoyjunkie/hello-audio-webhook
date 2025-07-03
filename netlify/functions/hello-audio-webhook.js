// This is our super helper program that handles everything!

exports.handler = async (event, context) => {
    console.log('Function called with method:', event.httpMethod);
    
    // Check if someone sent us information
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Get the information that was sent to us
        const data = JSON.parse(event.body);
        console.log('Received data:', data);
        
        // Your MailerLite and Hello Audio secrets
        const MAILERLITE_API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiMTI4OTBlNzdlOWMyMDMwM2VjZmE1N2VlMTMzZTk3NWI0NmZhYTM5NWExMGI5YzEwZTZjNDk1YzFkNjc1Y2E3NTI0NDVjODBmYzdjODVjNTYiLCJpYXQiOjE3NTEwNDg1MTAuNjk3OTg0LCJuYmYiOjE3NTEwNDg1MTAuNjk3OTg3LCJleHAiOjQ5MDY3MjIxMTAuNjkyNzkzLCJzdWIiOiIxNDA5ODQ5Iiwic2NvcGVzIjpbXX0.mAqiGcnwD7RVexE42XGb1sU3X328jetcisu9PSeCUOKRJe_-lEqq4LY9U-Y697mIAOxFj5g6SVuhAGXtvqnS7TuCjb_QtIsiEC_2H5fXkzhVuAHGPQAJ7pQSMS8mPUqAhDF4NP5WJdVK8Gi5rxgky5jqyBaKPIceeEOrCjKBe4JciKqhNbKhqHhKgUqOLEoor_Y1LGnjmYnr2HmvunLsCrAGqyvKewbqTcoaFwKB2ubunijYTFNhX4EIak-jjwWOkLCuJAKoZSedGodSNwOYFw8Jr9dKzpIPbAolYaX2mvL6sg9ZlWBX65AKBDXgjQ92_8wJ4IyT7nQHkODZcjiFgWFWC1BD6_GIOOr6cvXmqBiZNZ6gFGBPy4Pk7ux6nxnNidtDj3c6UR_XfNL1MhC1sU9LHfI1UrzQywyE5MppSNtzrYugwB0NEnYG9cwlrcMfpNp4Y6OuKInBCuyRkDrr9zRchjn3jc6YKfWersa9tnoFHtwlrzpNAi63sSJDCxU3ijTswfdwEXqiiTfvey1ONtAlNYdOHo2yAf5-5fJ6Fk4fKBmke0V4SpT7MJttrNwCF9iyuDnejBBK5Vv7HWdqtQkFWmHn-t-r6ToyuxK6EHmANJrHuBSi3w15xxS0VJVId3gYjvzWiPtE9EbNPXR_nS5n_X3EX0g9GUUb7xjruvI';
        const HELLO_AUDIO_WEBHOOK = 'https://podcasts.helloaudio.fm/webhook?apikey=5wv9i9CLF9TnMHGjAs0iv5F7vefUTz&feedId=0537459d-b904-4461-a1cf-17e5c0e7dbf0';
        
        // Group ID mapping
        const groupIds = {
            main: '157848137633891722', // BOD FREE Pod Series
            episode1: '158934537828566654', // BOB Episode 1 Completed
            episode2: '158934554263946635', // BOB Episode 2 Completed
            episode3: '158934565297063232', // BOB Episode 3 Completed
            episode4: '158934571095688230', // BOB Episode 4 Completed
            episode5: '158934576921577321', // BOB Episode 5 Completed
            episode6: '158934583901946885'  // BOB Episode 6 Completed
        };

        // Check if this is episode tracking OR new subscriber
        if (data.episode) {
            console.log('This is episode tracking for episode:', data.episode);
            // EPISODE TRACKING (existing functionality)
            const email = data.email;
            const episode = data.episode;
            
            const episodeGroupId = groupIds[`episode${episode}`];
            console.log('Adding to episode group:', episodeGroupId);
            
            const groupResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    groups: [episodeGroupId]
                })
            });

            console.log('Episode group response status:', groupResponse.status);
            return { statusCode: 200, body: JSON.stringify({ message: 'Episode tracking success!' }) };
            
        } else {
            console.log('This is a new subscriber from MailerLite');
            // NEW SUBSCRIBER (new functionality)
            
            // Get subscriber info from MailerLite data (handling their event format)
            let email, firstName, lastName;

            if (data.events && data.events[0] && data.events[0].subscriber) {
                // MailerLite automation format
                const subscriber = data.events[0].subscriber;
                email = subscriber.email;
                firstName = subscriber.fields?.name || subscriber.name || '';
                lastName = subscriber.fields?.last_name || subscriber.last_name || '';
            } else {
                // Direct format (for episode tracking)
                email = data.subscriber?.email || data.email;
                firstName = data.subscriber?.fields?.name || data.subscriber?.name || '';
                lastName = data.subscriber?.fields?.last_name || data.subscriber?.last_name || '';
            }
            
            console.log('Processing new subscriber:', { email, firstName, lastName });
            
            // Make sure we have an email before proceeding
            if (!email) {
                console.error('No email found in data');
                return { statusCode: 400, body: JSON.stringify({ error: 'No email provided' }) };
            }
            
            // Step 1: Add to Hello Audio (WITHOUT sending their email)
            console.log('Adding subscriber to Hello Audio...');
            const helloAudioResponse = await fetch(HELLO_AUDIO_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    status: "active",
                    sendEmail: false  // We'll send our own branded email!
                })
            });
            
            console.log('Hello Audio response status:', helloAudioResponse.status);
            const helloAudioResult = await helloAudioResponse.text();
            console.log('Hello Audio response:', helloAudioResult);
            
            // Step 2: Get the real personal link from Hello Audio's response
            let personalPodcastLink = '';
            if (helloAudioResponse.status === 200) {
                const helloAudioData = JSON.parse(helloAudioResult);
                personalPodcastLink = helloAudioData.subscribePageLink;
                console.log('Got real personal link:', personalPodcastLink);
            } else {
                personalPodcastLink = 'https://podcasts.helloaudio.fm/subscribe/0537459d-b904-4461-a1cf-17e5c0e7dbf0';
                console.log('Using fallback link');
            }
            
            // Step 3: Update MailerLite subscriber with their podcast link
            console.log('Updating MailerLite with podcast link...');
            const mailerLiteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
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
                        last_name: lastName,
                        podcast_link: personalPodcastLink  // Custom field for their link!
                    },
                    groups: [groupIds.main] // Add to main podcast group
                })
            });
            
            console.log('MailerLite response status:', mailerLiteResponse.status);
            const mailerLiteResult = await mailerLiteResponse.text();
            console.log('MailerLite response:', mailerLiteResult);
            
            return { 
                statusCode: 200, 
                body: JSON.stringify({ 
                    message: 'New subscriber processed successfully!',
                    podcast_link: personalPodcastLink
                }) 
            };
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Something went wrong: ' + error.message })
        };
    }
};
