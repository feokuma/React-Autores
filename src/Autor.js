import React, { Component } from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado';
import TratadorErro from './TratadorErros';

export class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = { nome: '', email: '', senha: '' };
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(event) {
        event.preventDefault();
        console.log("Dados sendo enviados");
        $.ajax({
            url: "https://cdc-react.herokuapp.com/api/autores",
            contentType: "application/json",
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
            success: function (resposta) {
                PubSub.publish('atualiza-lista-autores', resposta);
            },
            error: function (resposta) {
                if(resposta.status === 400){
                    new TratadorErro().publicaErros(resposta.responseJSON);
                }
            }
        });
    }

    setNome(evento) {
        this.setState({ nome: evento.target.value });
    }

    setEmail(evento) {
        this.setState({ email: evento.target.value });
    }

    setSenha(evento) {
        this.setState({ senha: evento.target.value });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" label="Nome" value={this.state.nome} onChange={this.setNome} />
                    <InputCustomizado id="email" type="email" name="email" label="Email" value={this.state.email} onChange={this.setEmail} />
                    <InputCustomizado id="senha" type="password" name="senha" label="Senha" value={this.state.senha} onChange={this.setSenha} />
                    <BotaoSubmitCustomizado label="Gravar" />
                </form>
            </div>
        );
    }
}

export class TabelaAutores extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.listaAutores.map(function (Autor) {
                                return (
                                    <tr key={Autor.id}>
                                        <td>{Autor.nome}</td>
                                        <td>{Autor.email}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = { listaAutores: [] };
    }

    componentDidMount() {
        $.ajax({
            url: "https://cdc-react.herokuapp.com/api/autores",
            dataType: 'json',
            success: function (resposta) {
                this.setState({ listaAutores: resposta });
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-autores', function(topico, novaListagem){
            this.setState({listaAutores: novaListagem});
        }.bind(this));
    }

    render() {
        return (
            <div>
                <FormularioAutor/>
                <TabelaAutores listaAutores={this.state.listaAutores}/>
            </div>
        );
    }
}