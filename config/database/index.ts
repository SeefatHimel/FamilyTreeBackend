import { connect } from "mongoose";
const dbUrl = "mongodb+srv://himel:himel@cluster0.6uvuj.mongodb.net/familyTree";
function ConnectDatabase() {
  const url = process.env.DATABASE_URL as any;
  console.log("🚀 ~ file: databaseConfig.ts:5 ~ ConnectDatabase ~ url:", url);
  connect(url, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("connected to Database");
    }
  });
}

export { ConnectDatabase };
