import { Component } from 'react';

class TestSSE extends Component {
    constructor(props) {
      super(props);
      this.userId = props.userId; 
      this.shouldReconnect = true;
    }
  
    componentDidMount() {
      this.eventSource = new EventSource(`http://localhost:8081/events?userId=${this.userId}`);
      console.log("EventSource created for user:", this.userId);
  
      this.eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data.message);
      };
  
      this.eventSource.onerror = (event) => {
        if (!this.shouldReconnect) {
          console.log('EventSource connection was closed, ignoring error.');
        } else {
          console.error('EventSource failed:', event);
        }
      };
    }
  
    componentWillUnmount() {
      if (this.eventSource) {
        this.shouldReconnect = false;
        this.eventSource.onmessage = null; // Remove the message event handler
        this.eventSource.onerror = null; // Remove the error event handler
        this.eventSource.close();
        console.log("EventSource closed for user:", this.userId);
      }
    }
  
    render() {
      return null;
    }
  }
  
  export default TestSSE;