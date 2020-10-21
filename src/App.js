import React, { useReducer, useState } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const API_URI = "https://www.googleapis.com/books/v1/volumes?";

const booksReducer = (state, action) => {
  switch(action.type) {
    case "BOOKS_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
      }
    case "BOOKS_FETCH_SUCCESS":
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
      }
    case "BOOKS_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case "BOOKS_CLEAR":
      return {
        ...state,
        data: [],
      }
    default:
      return state;
  }
}

function App() {
  const [books, booksDispatch] = useReducer(
    booksReducer,
    {
      data: [],
      isLoading: false,
      isError: false,
    }
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    booksDispatch({type: "BOOKS_FETCH_INIT"});
    try {
      const { data } = await axios.get(`${API_URI}q=${searchTerm}`);
      booksDispatch({type: "BOOKS_FETCH_SUCCESS", payload: data});
      setSearchTerm("");
    } catch(e) {
      console.error(e);
      booksDispatch({type: "BOOKS_FETCH_FAILURE"});
      booksDispatch({type: "BOOKS_CLEAR"});
    }
  }

  const renderBooks = () => 
      <section className="ListBook">
        {
          books.data.items.map(({volumeInfo}) => 
            <article className="Book" key={uuid()}>
              <h3><a href={volumeInfo.previewLink}>{volumeInfo.title}</a></h3>
              <div className="Info">
                <div className="Thumbnail">
                  <img alt="" src={volumeInfo.imageLinks.smallThumbnail} />
                </div>
                <div>
                  <p><b>Author:</b> {volumeInfo.authors.map(
                      (a, i) => {
                        if(i === volumeInfo.authors.length + 1) return a;
                        return a + ", "
                      }
                    )}
                  </p>
                  <p><b>Publisher:</b> {volumeInfo.publisher}</p>
                  <p><b>Published:</b> {volumeInfo.publishedDate}</p>
                </div>
              </div>
            </article>
          )
        }
      </section>;
  
  const renderError = () => <p className="Message">Ooops! Unable to fetch books :(</p>;
      const notFound = () => <p className="Message">No books found for "{searchTerm}"</p>;
  return (
    <div className="App">
      <header>
        <h1>BookFinder</h1>
      </header>
      <form onSubmit={e => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search..."
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <button 
          onClick={handleSearch} 
          disabled={searchTerm === "" ? true : false}
          >
            {books.isLoading ? <i className="fa fa-circle-o-notch fa-spin"></i> : <i className="fa fa-search"></i>}
        </button>
      </form>
      {books.isError && renderError()}
      {books.data.totalItems === 0 && notFound()}
      {books.data.totalItems > 0 && renderBooks()}
    </div>
  );
}

export default App;
