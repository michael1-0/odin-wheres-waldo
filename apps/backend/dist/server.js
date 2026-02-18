import app from "./app.js";
const PORT = process.env.PORT || 5000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map