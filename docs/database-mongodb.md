## DatabaseModule (MongoDB - Analytics)

Purpose:
- Initialize MongoDB connection using Mongoose
- Connect to the analytics database
- Log connection status (success / failure)

Configuration:
- URI loaded from AppConfigService → `mongoUri`
- Database name → `analyticsdb`

Connection health:
- Logs "MongoDB is connected!" when connection opens
- Logs "MongoDB connection error" on errors

MongoCheckService:
- Runs on module init
- Subscribes to connection events

Exports:
- MongooseModule

Why:
- Required for analytics storage
- Ensures DB connection issues are visible
- Keeps DB config centralized