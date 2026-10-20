import "./SearchBar.css";

function SearchBar({ value, onChange }) {

    return (

        <input
            className="search-bar"
            type="text"
            placeholder="Search users..."
            value={value}
            onChange={onChange}
        />

    );

}

export default SearchBar;