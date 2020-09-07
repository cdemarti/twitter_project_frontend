document.addEventListener("DOMContentLoaded", e => {
    console.log("page loaded")
    const baseUrl = 'http://localhost:3000/tweets'
    const wordBaseUrl = 'http://localhost:3000/words/'
    let allWords = []
    let wordCount = []
    let wordCloudArray = []
    let wordsWithNoArticles = []
    let wordContainer = document.getElementById('words-container')
    let searchContainer = document.getElementById('search-container')

    const fetchData = (handle, number) => {
        fetch(baseUrl + `/?handle=${handle}&number=${number}`)
        .then(res => res.json())
        .then(data => {
            pushTweetsIntoAllWords(data)
            wordCount = countOccurrences(wordsWithNoArticles)
            wordCloudArray = turnAllWordsIntoArray(wordCount)
            makeWordCloud(wordCloudArray)
        })
    }

    const fetchWordData = (word) => {
        fetch(wordBaseUrl + `?word=${word}` )
        .then(res => res.json())
        .then(showDefinitionAndSynonyms)
    }

    const showDefinitionAndSynonyms = (wordObject) => {
        const masterDiv = document.createElement('div')
        masterDiv.id = "definition-container"
        document.getElementById('def-layout').append(masterDiv)
        let results = wordObject.results
        const nameDiv = document.createElement('div')
        nameDiv.id = "word-name"
        const defDiv = document.createElement('div')
        defDiv.id = "word-def"
        const synDiv = document.createElement('div')
        synDiv.id = "word-syn"
        nameDiv.innerText = wordObject.word 
        for (const result of results) {
            defDiv.insertAdjacentHTML('beforeend',`
            <p> Defintion: ${result.definition}</p>
            <p> Part of Speech: ${result.partOfSpeech}</p>
            `)
            let syns = result.synonyms
            console.log(syns)
            const ul = document.createElement('ul')
            if (syns) {
                for (const word of syns) {
                    const li = document.createElement('li')
                    li.innerText = word
                    ul.append(li)
                }
            }
            synDiv.append(ul) 
        }
        masterDiv.append(nameDiv, defDiv, synDiv)
    }

    const clickHandler = () => {
        document.addEventListener('click', e => {
            if (e.target.matches('span')) {
                let layout = document.getElementById('no-def-layout')
                layout.id = 'def-layout'
                document.getElementById("handle-search-bar").style.display = 'none'
                let word = e.target.textContent
                fetchWordData(word)
            }
        })
    }

    const pushTweetsIntoAllWords = (tweets) => {
        for (const tweet of tweets) {
            pushTweetIntoAllWords(tweet)
        }
    }

    const pushTweetIntoAllWords = (tweet) => {
        const tweetText = tweet.text 
        const tweetTextWords = tweetText.replace(/[^A-Za-z- ']+/g, '')
        const tweetTextWordsLowerCase = tweetTextWords.toLowerCase()
        const wordArray = tweetTextWordsLowerCase.split(" ")
        for (const word of wordArray) {
            allWords.push(word)
        }
        checkWordsForArticles(allWords)
    }

    const checkWordsForArticles = (wordArray) => {
        let articles = ['if', 'of', 'the', 'for', 'and', 'a', 'to', 'be', 'rt', 'by', 'in', '', 'is']
        for (const word of wordArray) {
            if (articles.includes(word)) {
                console.log(word)
            } else {
                wordsWithNoArticles.push(word)
            }
        }
    }

    const countOccurrences = arr => {
        return arr.reduce((prev, curr) => (prev[curr] = ++prev[curr] || 1, prev), {});
    }

    const submitHandler = () => {
        const handleForm = document.getElementById('handle-search-bar')
        handleForm.addEventListener("submit", e => {
            e.preventDefault()
            searchContainer.className = "other-search"
            const handle = handleForm.handle.value
            const number = parseInt(handleForm.amount.value)
            allWords = []
            wordContainer.innerHTML = ""
            const tweetContainer = document.getElementById("tweets-container")
            tweetContainer.innerHTML = ""
            tweetContainer.append(createATag(number, handle))
            tweetContainer.append(createTweetWidget())
            
            fetchData(handle, number)         
        })
    }

    const createTweetWidget = () => {
        const script = document.createElement("script")
        script.src = "https://platform.twitter.com/widgets.js"
        script.charset = "utf-8"
        return script
    }

    const createATag = (number, handle) => {
        const a = document.createElement('a')
        a.classList.add("twitter-timeline")
        a.dataset.width = "250"
        a.dataset.height = "450"
        a.dataset.theme = "light"
        a.dataset.tweetLimit = number
        a.href = `https://twitter.com/${handle}`
        return a  
    }

    const makeWordCloud = (list) => {
        WordCloud(wordContainer, { list: list } );
    }

    const turnAllWordsIntoArray = (wordCount) => {
        wordCloudArray = []
        for (word in wordCount) {
            wordCloudArray.push([word, (parseInt(wordCount[word]) * 5)])
        }
        return wordCloudArray
    }

    submitHandler()
    clickHandler()
})