import React from "react"
import Layout from "../components/layout"
import config from "../../config.json"
import Title from "../components/title"


const seo = {
    title: "Manage Subscriptions",
}
export default class Subscription extends React.Component {
    constructor(props) {
        super(props)
        this.submit = this.submit.bind(this)
        this.email = React.createRef()

        this.state = {
            hasToken: false,
            searchParams: {},
            subscriptions: false,
            formResult: {
                message: false,
                error: true
            }
        }
    }

    componentDidMount(){
        let params = (new URL(document.location)).searchParams;
        if(params.has("token")){
            this.setState({
                hasToken: true,
                searchParams: {
                    token: params.get("token")
                }
            })
            const headers = {
                'Content-Type': 'application/json'
            }
            fetch(`${config.cms}/wp-json/restcommentsubscribing/v1/manage`,
            {
                method: "post",
                body: JSON.stringify({
                    token:params.get("token")
                }),
                headers: headers,
            }).then((response) => {
                return response.json();
            }).then(obj => {
                if(obj.result === "success"){
                    const data = JSON.parse(obj.data);
                    this.setState({
                        subscriptions: data
                    })
                }
            })
        }
        
    }

    submit(event) {
        event.preventDefault()
        fetch(`${config.cms}/wp-json/restcommentsubscribing/v1/req_manage`,
            {
                method: "post",
                body: JSON.stringify({
                    email: this.email.current.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((response) => {
                return response.json();
            }).then(obj => {
                if(obj.result === "success"){
                    this.email.current.value = "";
                    this.setState({
                        formResult:{
                            message: "Email sent succesfully",
                            error: false
                        } 
                    })
                }else {
                    this.setState({
                        formResult: {
                            message: "Error sending email",
                            error: true
                        }
                    })
                }
            })
    }

    render() {
        return (
            <Layout seo={seo}>
                <div className="section">
                    <div className="container">
                        <div className="boxed">
                            <Title data="Manage Subscriptions" />
                            <div className="page-content">
                                {(this.state.hasToken && !this.state.subscriptions) &&
                                <div className="text-center">
                                    <p>Loading, please wait</p>
                                </div>
                                }
                                {this.state.subscriptions && 
                                    <Subscriptions data={this.state.subscriptions}/>
                                }
                                {!this.state.hasToken && (
                                    <form onSubmit={this.submit}>
                                        <p>To manage your subscriptions, please enter your email address.</p>
                                        <div className="input-field">
                                            <label>
                                                <p>Email</p>
                                                <div className="field">
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        ref={this.email}
                                                        name="email"
                                                    />
                                                </div>
                                            </label>
                                        </div>
                                        {
                                            this.state.formResult.message && (
                                                <p className={this.state.formResult.error ? "error": "success"}>{this.state.formResult.message}</p>
                                            )
                                        }
                                        <div className="input-field">
                                            <button type="submit" className="btn">Submit</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }
}

class Subscriptions extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            checkedItems: []
        }

    }

    addCheckedItems = (data) => {
        if(!this.state.checkedItems.includes(data)){
            const items = this.state.checkedItems;
            items.push(data);
            this.setState({
                checkedItems: items
            })
        }
    }

    removeCheckedItems = (data) => {
        if(this.state.checkedItems.includes(data)){
            const items = this.state.checkedItems.filter(e => e !== data);
            this.setState({
                checkedItems: items
            })
        }
    }

    render(){

        const data = this.props.data;

        const list = [];

        data.forEach((item,index) => {
            list.push(
                <Row key={"tr"+index+""+item.id} data={item} id={item.id} addCheckedItems={this.addCheckedItems} removeCheckedItems={this.removeCheckedItems}/>
            )
        })
        
        return (
            <div>
                <table>
                    <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Post</th>
                        <th>Comment</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </table>
                <button className="btn" disabled={(this.state.checkedItems.length === 0) ? true: false} title={(this.state.checkedItems.length === 0) ? "Please select an item to unsubscribe": "Unsubscribe selected items"}>Unsubscribe selected</button>
            </div>
        )
    }
}

class Row extends React.Component{

    constructor(props){
        super(props);
        this.handleCheckBox = this.handleCheckBox.bind(this);
        this.unsub = this.unsub.bind(this);
    }

    handleCheckBox(e){
        const data = this.props.data;

        const target = e.target;
        if(target.checked){
            this.props.addCheckedItems(data.comment.id)
        } else {
            this.props.removeCheckedItems(data.comment.id)
        }
    }

    unsub(e){
        e.preventDefault();

        let params = (new URL(document.location)).searchParams;
        fetch(`${config.cms}/wp-json/restcommentsubscribing/v1/unsub`,
            {
                method: "post",
                body: JSON.stringify({
                    token: params.get("token"),
                    unsub: this.props.data.comment.id
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((response) => {
                return response.json();
            }).then(obj => {
                console.log(obj);
            })
    }

    render(){
        const data = this.props.data;

        return (
            <tr className="subscription-item">
                <td>
                    <div className="input-field checkbox">
                        <label>
                            <input type="checkbox" name="select-subscriptions" onChange={this.handleCheckBox}/>
                            <span className="icon"></span>
                        </label>
                    </div>
                </td>
                <td>{data.name}</td>
                <td><a href={data.post.slug} title={data.post.title}>{data.post.title}</a></td>
                <td><a href={`${data.post.slug}#c${data.comment.id}`}>{data.comment.content}</a></td>
                <td><a href="#unsub" onClick={this.unsub}>Unsubscribe</a></td>
            </tr>
        )
    }
}