import "./Navigation.css"

function Navigation(){
    return(
        <div className="sidenav" id ="sidenav">
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Good convos</a></li>
                <li><a href="#">Bad convos</a></li>
            </ul>
        </div>
    );
}

export default Navigation;