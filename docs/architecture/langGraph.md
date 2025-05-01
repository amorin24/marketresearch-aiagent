# LangGraph/LangChain Architecture

## Overview

LangGraph is an extension of LangChain that provides a state graph abstraction for creating stateful, multi-actor applications with LLMs. It focuses on composable agent workflows with state management and cyclical execution flows.

## Architecture Diagram

```mermaid
graph TD
    subgraph Graph["LangGraph Workflow"]
        direction LR
        
        RN[Research Node] --> EN[Extraction Node]
        EN --> AN[Analysis Node]
        
        subgraph State["State Management"]
            S1[Research State]
            S2[Extraction State]
            S3[Analysis State]
        end
        
        RN -- updates --> S1
        EN -- updates --> S2
        AN -- updates --> S3
    end
    
    subgraph NodeConfig["Node Configuration"]
        RN_Config[Research Node<br>Tools: web_search, news_retriever<br>Model: gpt-4<br>Memory: true]
        EN_Config[Extraction Node<br>Tools: web_scraper, document_parser<br>Model: gpt-4<br>Memory: true]
        AN_Config[Analysis Node<br>Tools: calculator, ranking_system<br>Model: gpt-4<br>Memory: true]
    end
    
    subgraph Tools["Tool Integration"]
        RN -- uses --> WebSearch[Web Search]
        RN -- uses --> NewsRetriever[News Retriever]
        EN -- uses --> WebScraper[Web Scraper]
        EN -- uses --> DocParser[Document Parser]
        AN -- uses --> Calculator[Calculator]
        AN -- uses --> RankingSystem[Ranking System]
    end
    
    subgraph Workflow["Execution Flow"]
        Input[Input Parameters] --> RN
        AN --> Output[Analyzed Companies]
    end
    
    RN_Config -.configures.-> RN
    EN_Config -.configures.-> EN
    AN_Config -.configures.-> AN
    
    classDef node fill:#f9d5e5,stroke:#333,stroke-width:2px;
    classDef config fill:#d6e1c7,stroke:#333,stroke-width:1px;
    classDef tool fill:#e06377,stroke:#333,stroke-width:1px;
    classDef state fill:#5b9aa0,stroke:#333,stroke-width:1px;
    classDef flow fill:#eeac99,stroke:#333,stroke-width:1px;
    
    class RN,EN,AN node;
    class RN_Config,EN_Config,AN_Config config;
    class WebSearch,NewsRetriever,WebScraper,DocParser,Calculator,RankingSystem tool;
    class S1,S2,S3 state;
    class Input,Output flow;
```

## Key Components

### 1. Nodes
LangGraph uses specialized nodes that perform specific functions in the workflow:

- **Research Node**:
  - Description: Research emerging fintech companies
  - Tools: web_search, news_retriever
  - Model: gpt-4
  - Memory: enabled
  - Function: Searches for and collects data about fintech companies

- **Extraction Node**:
  - Description: Extract structured data from research results
  - Tools: web_scraper, document_parser
  - Model: gpt-4
  - Memory: enabled
  - Function: Extracts and validates structured information from collected data

- **Analysis Node**:
  - Description: Analyze and score companies based on criteria
  - Tools: calculator, ranking_system
  - Model: gpt-4
  - Memory: enabled
  - Function: Analyzes market position, evaluates strategic relevance, and calculates scores

### 2. Graph
The central organizing structure in LangGraph. A graph consists of:
- Nodes that perform specific functions
- Edges that define the flow between nodes
- An entry point (Research Node)

### 3. State Management
LangGraph provides state management capabilities:
- Each node can update and access state
- State persists throughout the execution flow
- Enables complex, stateful applications

### 4. Workflow
The graph execution follows a directed flow:

1. Research Node searches for fintech companies and collects data
2. Extraction Node extracts structured information from the research results
3. Analysis Node analyzes the extracted data and calculates scores

### 5. Tools
Nodes can use various tools to accomplish their tasks:
- Web search
- News retriever
- Web scraper
- Document parser
- Calculator
- Ranking system

## Strengths

- Composable agent workflows
- State management and persistence
- Cyclical and conditional execution flows
- Extensive tool integration
- Document processing and retrieval

## Limitations

- Requires OpenAI API key
- Complex graph definition for advanced workflows
- Steeper learning curve than some frameworks

## References

- LangGraph documentation: https://python.langchain.com/docs/langgraph
- LangChain documentation: https://python.langchain.com/docs/get_started
