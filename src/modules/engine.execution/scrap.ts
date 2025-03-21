/*
private static async traverse(
        context: CContext,
        schemaInstance: CSchemaInstance,
        currentNodeInstance: CNodeInstance,
        facts: any
    ): Promise<CNodeInstance> {

        const processor = Injector.Container.resolve(ProcessorService);

        const rules = currentNodeInstance.Rules;
        if (rules.length > 0) {
            var facts: any = SchemaEngine.extractFactsForNode(facts, currentNodeInstance);
            var successEvent: any = undefined;

            for (var r of rules) {
                const engine = new Engine();
                var rule = RuleConverter.convertRule(r);
                engine.addRule(rule);
                engine.on('success', async (event, almanac) => {
                    successEvent = event;
                    logger.info(`%cRule Execution Result: '${r.Name}' has passed for context '${context}'.`);
                });
                engine.on('failure', async (event, almanac)=> {
                    logger.error(`%cRule Execution Result: '${r.Name}' has failed for context '${context}'.`);
                });
                const results = await engine.run(facts);
            }
        }
        else if (currentNodeInstance.Action) {

            // Execute this node's default action and then move onto the next node
            const action = currentNodeInstance.Action;
            const actionType = action.ActionType;

            if (actionType === ActionType.ExtractData) {
                //Extract data based on the action subject filters
                const data = await processor.extractData(context.id, action.InputParams, action.OutputParams);
                schemaInstance.Almanac.push({
                    Name : data.Tag,
                    Data : data.Data
                });
                return SchemaEngine.getNextNode(currentNodeInstance, schemaInstance);
            }
            else if (actionType === ActionType.ProcessData) {
                const subject = action.InputParams;
                const dataActionType = subject.DataActionType;
                const almanacObject = schemaInstance.fetchAlmanacData(subject.InputTag);
                if (!almanacObject) {
                    throw new Error(`Records with tag ${subject.InputTag} not found in schema almanac.`);
                }
                if (dataActionType === DataActionType.CalculateContinuity) {
                    const data = await processor.calculateContinuity(
                        almanacObject.Data,
                        action.InputParams as ContinuityInputParams,
                        action.OutputParams as OutputParams);
                    schemaInstance.Almanac.push({
                        Name : data.Tag,
                        Data : data.Data
                    });
                }

                return SchemaEngine.getNextNode(currentNodeInstance, schemaInstance);
            }
            else if (actionType === ActionType.CompareData) {
                const inputParams = action.InputParams;
                const dataActionType = inputParams.DataActionType;
                const almanacObjectFirst = schemaInstance.fetchAlmanacData(inputParams.InputTag);
                if (!almanacObjectFirst) {
                    throw new Error(`Records with tag ${inputParams.InputTag} not found in schema almanac.`);
                }
                const almanacObjectSecond = schemaInstance.fetchAlmanacData(inputParams.SecondaryInputTag);
                if (!almanacObjectSecond) {
                    throw new Error(
                         `Records with tag ${inputParams.SecondaryInputTag} not found in schema almanac.`);
                }
                if (dataActionType === DataActionType.FindRangeDifference) {
                    const data = await processor.compareRanges(
                        almanacObjectFirst.Data,
                        almanacObjectSecond.Data,
                        action.InputParams as RangeComparisonInputParams,
                        action.OutputParams as OutputParams);
                    schemaInstance.Almanac.push({
                        Name : data.Tag,
                        Data : data.Data
                    });
                }

                return SchemaEngine.getNextNode(currentNodeInstance, schemaInstance);
            }
            else if (actionType === ActionType.StoreData) {
                const inputParams = action.InputParams;
                const almanacObject = schemaInstance.fetchAlmanacData(inputParams.InputTag);
                if (!almanacObject) {
                    throw new Error(`Records with tag ${inputParams.InputTag} not found in schema almanac.`);
                }
                var removedData = null;
                if (almanacObject.Data.ToBeRemoved.length > 0) {
                    const removed = await processor.removeData(
                        context.id, almanacObject.Data.ToBeRemoved, action.InputParams, action.OutputParams);
                    removedData = removed?.Data;
                }
                const added = await processor.storeData(
                    context.id, almanacObject.Data.ToBeAdded, action.InputParams, action.OutputParams);
                schemaInstance.Almanac.push({
                    Name : action.OutputParams.OutputTag,
                    Data : {
                        Added   : added.Data,
                        Removed : removedData,
                    }
                });
                return SchemaEngine.getNextNode(currentNodeInstance, schemaInstance);
            }
            else if (actionType === ActionType.Custom) {
                //
            }
            else if (actionType === ActionType.Exit) {
                //
            }
            else if (actionType === ActionType.ExecuteNext) {
                //
            }
            else if (actionType === ActionType.WaitForInputEvents) {
                //
            }
        }

        if (successEvent) {

            //logger.info(`successEvent = ${JSON.stringify(successEvent, null, 2)}`);

            var action = successEvent.params?.Action as ActionType;
            var nextNodeId = successEvent.params?.NextNodeId;
            if (action === ActionType.ExecuteNext && nextNodeId != null) {
                var nextNode = schemaInstance.NodeInstances.find(x => x.NodeId === nextNodeId);
                if (nextNode) {
                    currentNodeInstance.ExecutionStatus = ExecutionStatus.Executed;
                    currentNodeInstance = nextNode;
                    logger.info(`\nCurrent node    : ${currentNodeInstance.Name}`);
                    logger.info(`Current node Id : ${currentNodeInstance.id}\n`);
                }
            }
            else if (action === ActionType.WaitForInputEvents) {
                currentNodeInstance.ExecutionStatus = ExecutionStatus.Waiting;
                logger.warn(`%cWaiting for input events for necessary facts!`);
            }
        }
        else {
            currentNodeInstance.ExecutionStatus = ExecutionStatus.Executed;
        }

        return currentNodeInstance;
    }

    private static extractFactsForNode(incomingFacts: any, currentNode: CNodeInstance) {
        var factKeys = Object.keys(incomingFacts.Facts);
        var nodeFactNames: string[] = currentNode.extractFacts();
        var facts: any = {};
        for (var fn of nodeFactNames) {
            var foundFactKey = factKeys.find(x => x === fn);
            if (foundFactKey) {
                var factValue = incomingFacts.Facts[fn];
                facts[fn] = factValue;
            }
            else {
                facts[fn] = undefined;
                logger.info(`Needed fact-${fn} is not yet available!`);
            }
        }
        return facts;
    }

    private static getNextNode = (currentNodeInstance, schemaInstance) => {
        if (currentNodeInstance.Action &&
            currentNodeInstance.Action.OutputParams &&
            currentNodeInstance.Action.OutputParams.NextNodeId) {
            const nextNodeId = currentNodeInstance.Action.OutputParams.NextNodeId;
            const nodeInstances = schemaInstance.NodeInstances;
            const newCurrentNodeInstance = nodeInstances.find(x => x.NodeId === nextNodeId);
            if (newCurrentNodeInstance) {
                return newCurrentNodeInstance;
            }
        }
        return null;
    };

    */
