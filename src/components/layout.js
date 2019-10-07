import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import { Helmet } from "react-helmet";

import Header from "./header"

import "../styles/theme.less";

const Layout = ({ children }) => {
    const data = useStaticQuery(graphql`
        query SiteTitleQuery {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    return (
        <>
            <Helmet>
                <link href="https://fonts.googleapis.com/css?family=Poppins:400,900" rel="stylesheet"/>
            </Helmet>
            <Header />
            <main>{children}</main>
            <footer>
                
            </footer>
        </>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
}

export default Layout
