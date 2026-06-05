with open("src/App.jsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace("const [session, setSession] = useState(null);", "const [session, setSession] = useState({ user: { id: 'test' } });")

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(code)
