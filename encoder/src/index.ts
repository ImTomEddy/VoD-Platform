import dotenv from 'dotenv';

import App from './app/app';

const app = new App();

/**
 * Load Environment Variables
 */
const env = dotenv.config();

if (env.error) {
    console.log('Error with dotenv.');
    throw env.error;
}

/**
 * Start Application
 */
app.setup();