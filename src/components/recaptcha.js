import React from "react"
import Script from 'react-load-script'
import config from "../../config.json"


export default class ReCaptcha extends React.Component {

    constructor(props){
        super(props);
        this.state={
            scriptError: false,
            scriptLoaded: false,
            token: false
        }
    }

    handleScriptError() {
        this.setState({ scriptError: true })
    }
       
    handleScriptLoad() {
        this.setState({ scriptLoaded: true })
    }

    generate = () => {
        const _g = window.grecaptcha;
        if(this.state.token){
            this.setState({
                token: false
            })
        }
        _g.ready(() => {
            _g.execute(config.sitekey).then((t) => {
                this.setState({
                    token: t
                })
            })
        })
    }

    componentDidUpdate(){
        if(this.state.scriptLoaded && !this.state.token){
            this.generate();
        }
    }

    render (){
        return(
            <React.Fragment>
                <Script
                url={`https://www.google.com/recaptcha/api.js?render=${config.sitekey}`}
                onError={this.handleScriptError.bind(this)}
                onLoad={this.handleScriptLoad.bind(this)}
                />
                {React.cloneElement(this.props.children, {recaptchaToken: this.state.token, generateRecaptcha: this.generate})}
            </React.Fragment>
        )
    }
}