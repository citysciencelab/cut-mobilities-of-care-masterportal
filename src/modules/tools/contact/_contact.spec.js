// TODO recycle/refactor these tests

/*
describe("Contact.vue", () => {
    let contact,
        store;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        IndexContact
                    }
                },
                configJson: {
                    namespaced: true,
                    modules: {
                        Portalconfig: {
                            namespaced: true,
                            modules: {
                                menu: {
                                    namespaced: true,
                                    modules: {
                                        contact: {
                                            namespaced: true,
                                            state: configContact
                                        }
                                    }
                                },
                                portalTitle: {
                                    namespaced: true,
                                    state: {
                                        title: "test title"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        contact = shallowMount(Contact, {store, localVue, mocks});
    });

        let receivedUrl = false,
            receivedData = false;

        beforeEach(() => {
            receivedUrl = false;
            receivedData = false;

            contact.setData({
                username: String().padStart(contact.vm.minUsernameLength, "x"),
                email: "foo@bar.baz",
                phone: "123456789",
                message: String().padStart(contact.vm.minMessageLength, "x"),
                termsOfPrivacyChecked: true,
                showTermsOfPrivacy: true
            });
        });

        it("should deny sending data if username is set improperly", () => {
            contact.setData({username: String().padStart(contact.vm.minUsernameLength - 1, "x")});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.be.false;
            expect(receivedData).to.be.false;
        });
        it("should deny sending data if the email address is set improperly", () => {
            contact.setData({email: "foo@bar.hamburgX"});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.be.false;
            expect(receivedData).to.be.false;
        });
        it("should deny sending data if the phone number is set improperly", () => {
            contact.setData({phone: "foobar"});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.be.false;
            expect(receivedData).to.be.false;
        });
        it("should deny sending data if the message text is set improperly", () => {
            contact.setData({message: String().padStart(contact.vm.minMessageLength - 1, "x")});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.be.false;
            expect(receivedData).to.be.false;
        });
        it("should deny sending data if the privacy checkbox is unchecked", () => {
            contact.setData({termsOfPrivacyChecked: false});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.be.false;
            expect(receivedData).to.be.false;
        });
        it("should call an error if no url is received by RestReader", () => {
            let receivedMsg = false,
                receivedError = false;

            contact.setData({serviceID: 123456789});

            contact.vm.send(() => {
                // onstart
            }, () => {
                // onsuccess
            }, (msg, error) => {
                // onerror - msg is for the customer (alert), error ist for the dev (console)
                receivedMsg = msg;
                receivedError = error;
            }, () => {
                // oncomplete
            }, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, {
                // restReaders response
                get: () => {
                    return undefined;
                }
            });

            expect(receivedMsg).to.equal("modules.tools.contact.errorMessage");
            expect(receivedError.indexOf(contact.vm.serviceID)).to.not.equal(-1);
        });

        it("should send data", () => {
            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            expect(receivedUrl).to.equal("goodRestReaderBar");
            expect(receivedData.from).to.deep.equal(store.state.configJson.Portalconfig.menu.contact.from);
            expect(receivedData.to).to.deep.equal(store.state.configJson.Portalconfig.menu.contact.to);
            expect(receivedData.subject).to.be.a("string").to.not.be.empty;
            expect(receivedData.text.indexOf(contact.vm.username)).to.not.equal(-1);
            expect(receivedData.text.indexOf(contact.vm.email)).to.not.equal(-1);
            expect(receivedData.text.indexOf(contact.vm.phone)).to.not.equal(-1);
            expect(receivedData.text.indexOf(contact.vm.message)).to.not.equal(-1);
        });
        it("should send data with unchecked privacy terms if no check is recommended", () => {
            contact.setData({
                termsOfPrivacyChecked: false,
                showTermsOfPrivacy: false
            });

            contact.vm.send(...impotentCallbacks, () => {
                // httpClient
                receivedUrl = true;
            }, goodRestReader);

            expect(receivedUrl).to.be.true;
        });
        it("should override subject if given by config", () => {
            const expectedExpression = /^[0-9]{2}[0-9]{2}-[1-9]{1}[0-9]{3}: foobar$/g;

            contact.setData({subject: "foobar"});

            contact.vm.send(...impotentCallbacks, (url, data) => {
                // httpClient
                receivedUrl = url;
                receivedData = data;
            }, goodRestReader);

            // in this case to.not.be.null (which is not recommended) is ok
            expect(receivedData.subject.match(expectedExpression)).to.not.be.null;
        });
    });

    describe("DOM contact form", () => {
        it("should have input elements for username, email (type email) and phone (type tel)", () => {
            expect(contact.find("#contactInputUsername").exists()).to.be.true;
            expect(contact.find("#contactInputUsername").attributes("type")).to.equal("text");
            expect(contact.find("#contactInputEmail").exists()).to.be.true;
            expect(contact.find("#contactInputEmail").attributes("type")).to.equal("email");
            expect(contact.find("#contactInputPhone").exists()).to.be.true;
            expect(contact.find("#contactInputPhone").attributes("type")).to.equal("tel");
        });
        it("should have a textarea for the message", () => {
            expect(contact.find("#contactInputMessage").exists()).to.be.true;
        });

        it("should have a checkbox for terms of privacy if recommended", () => {
            contact.setData({showTermsOfPrivacy: true}).then(() => {
                expect(contact.find("#contactTermsOfPrivacy").exists()).to.be.true;
            });
        });
        it("should have a checked checkbox for terms of privacy if clicked", () => {
            expect(contact.vm.termsOfPrivacyChecked).to.be.false;

            contact.setData({showTermsOfPrivacy: true}).then(() => {
                expect(contact.find("#contactTermsOfPrivacy").exists()).to.be.true;
                contact.find("input[type='checkbox']").setChecked().then(() => {
                    expect(contact.vm.termsOfPrivacyChecked).to.be.true;
                });
            });
        });
        it("should have no checkbox for terms of privacy if not recommended", () => {
            contact.setData({showTermsOfPrivacy: false}).then(() => {
                expect(contact.find("#contactTermsOfPrivacy").exists()).to.be.false;
            });
        });

        it("should have a disabled button", () => {
            expect(contact.find("button").attributes("disabled")).to.equal("disabled");
        });
        it("should have an enabled button if form is filled", () => {
            contact.setData({
                username: String().padStart(contact.vm.minUsernameLength, "x"),
                email: "foo@bar.baz",
                phone: "123456789",
                message: String().padStart(contact.vm.minMessageLength, "x"),
                termsOfPrivacyChecked: true,
                showTermsOfPrivacy: true
            }).then(() => {
                expect(contact.find("button").attributes("disabled")).to.be.undefined;
            });
        });
    });
});*/
