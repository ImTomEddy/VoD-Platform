export default class Response {
    private static base = {
        api: {
            version: '0.0.0',
            for: 'VoD Platform',
        },
        message: undefined,
        error: undefined,
        success: true,
        status: 200,
    };

    static getError = (error: any) => {
        const response = { ...Response.base };

        response.error = error.message;
        response.status = error.status || 500;

        response.success = false;

        return response;
    }

    static getMessage = (message: any) => {
        const response = { ...Response.base };

        response.message = message;

        return response;
    }
}
