/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useContext, useState, useEffect } from 'react';
import { CloudDownload } from '@mui/icons-material';
import API from 'AppData/api.js';
import Alert from 'AppComponents/Shared/Alert';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';
import type { CreatePolicySpec } from './Types';
import YAML from 'yaml';
import { Dialog, styled, Theme } from '@mui/material';

const PREFIX = 'CreatePolicy';

const classes = {
    link: `${PREFIX}-link`
};

// Define the interface for the expected data structure
interface PolicyData {
    id: string; // or number, depending on your data
    items: Array<{
        name: string;
        avatar?: string;
        icon?: boolean;
        textColor?: string;
    }>;
    policySpecContent: string
    synapsePolicyDefinition: string
}

const ProfileCard = ({ data, onImport }: { data: PolicyData; onImport: (data: PolicyData) => void }) => {
    const [selectedItem, setSelectedItem] = useState(data.items[0]?.name || '');

    return (
        <div
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                marginTop: '2rem'
            }}
        >
            {/* Card Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {data.items.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedItem(item.name)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            backgroundColor:
                                selectedItem === item.name ? '#F3F4F6' : 'transparent',
                            borderRadius: '0.375rem',
                            paddingRight: '1.5rem',
                        }}
                    >
                        {/* Avatar or placeholder */}
                        {item.avatar ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '3.5rem',
                                    height: '3.5rem',
                                    backgroundColor: '#F3F4F6',
                                    color: '#4B5563',
                                    fontWeight: 500,
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem',
                                }}
                            >
                                {item.avatar}
                            </div>
                        ) : index === 0 ? (
                            <div style={{ width: '3.5rem' }} />
                        ) : null}

                        {/* Icon + name OR just name */}
                        {item.icon ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: item.textColor || '#6B7280',
                                }}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ marginRight: '0.5rem' }}
                                >
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                                <span style={{ color: item.textColor || '#6B7280' }}>
                                    {item.name}
                                </span>
                            </div>
                        ) : (
                            <span
                                style={{
                                    fontSize: '1.125rem',
                                    color: item.textColor || '#4B5563',
                                    fontWeight:
                                        selectedItem === item.name ? 600 : 400,
                                }}
                            >
                                {item.name}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div
                style={{
                    borderTop: '1px solid #E5E7EB',
                    margin: '1.5rem 0 1rem 0',
                }}
            />

            {/* Footer with action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    style={{
                        padding: '0.5rem 0.75rem',
                        color: '#2563EB',
                        borderRadius: '0.375rem',
                        backgroundColor: '#EFF6FF',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => onImport(data)}
                >
                    <CloudDownload />
                </button>
            </div>
        </div>
    );
};

const Root = styled('div')(({ theme }: { theme: Theme }) => ({
    [`& .${classes.link}`]: {
        color: theme.palette.primary.dark,
        marginLeft: theme.spacing(2),
        display: 'inline',
    }
}));

interface ImportPolicyProps {
    handleDialogClose: () => void;
    dialogOpen: boolean;
    fetchPolicies: () => void;
}

/**
 * Renders the UI to create a new policy.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy create UI.
 */
const ImportPolicy: React.FC<ImportPolicyProps> = ({
    handleDialogClose,
    dialogOpen,
    fetchPolicies,
}) => {

    const { api } = useContext<any>(ApiContext);
    const [saving, setSaving] = useState(false);
    const [synapsePolicyDefinitionFile, setSynapsePolicyDefinitionFile] = useState<any[]>([]);
    const [ccPolicyDefinitionFile, setCcPolicyDefinitionFile] = useState<any[]>([]);

    const data = [
        {
            "id": "JSON_SCHEMA",
            "items": [
                {
                    "name": "JSON Schema Guardrail",
                    "avatar": "JS",
                    "textColor": "text-black font-medium"
                },
                {
                    "name": "Request/ Response",
                    "textColor": "text-gray-500"
                },
                {
                    "name": "WSO2",
                    "icon": true,
                    "textColor": "text-gray-500"
                }
            ],
            "policySpecContent": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/jsonSchema/jsonSchemaGuardrail.yaml",
            "synapsePolicyDefinition": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/jsonSchema/jsonSchemaGuardrail2.j2"
        },
        {
            "id": "AWS_BEDROCK",
            "items": [
                {
                    "name": "AWS Bedrock Guardrail",
                    "avatar": "BG",
                    "textColor": "text-black font-medium"
                },
                {
                    "name": "Request/ Response",
                    "textColor": "text-gray-500"
                },
                {
                    "name": "AWS",
                    "icon": true,
                    "textColor": "text-gray-500"
                }
            ],
            "policySpecContent": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/bedrock/custom.yaml",
            "synapsePolicyDefinition": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/bedrock/custom.j2"
        },
        {
            "id": "CUSTOM_AWS_BEDROCK",
            "items": [
                {
                    "name": "AWS Bedrock Guardrail",
                    "avatar": "CBG",
                    "textColor": "text-black font-medium"
                },
                {
                    "name": "Request/ Response",
                    "textColor": "text-gray-500"
                },
                {
                    "name": "AWS",
                    "icon": true,
                    "textColor": "text-gray-500"
                }
            ],
            "policySpecContent": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/bedrock/AWSBedrockGuardrail.yaml",
            "synapsePolicyDefinition": "https://raw.githubusercontent.com/nimsara66/guardrail-policies/refs/heads/main/bedrock/AWSBedrockGuardrailCustom.j2"
        }
    ]

    const savePolicy = (
        policySpecContent: CreatePolicySpec,
        synapsePolicyDefinition: any,
        ccPolicyDefinition: any,
    ) => {
        setSaving(true);
        const promisedCommonPolicyAdd = API.addOperationPolicy(
            policySpecContent,
            api.id,
            synapsePolicyDefinition,
            ccPolicyDefinition,
        );
        promisedCommonPolicyAdd
            .then(() => {
                Alert.info('Policy created successfully!');
                setSynapsePolicyDefinitionFile([]);
                setCcPolicyDefinitionFile([]);
                handleDialogClose();
                fetchPolicies();
            })
            .catch((error) => {
                handleDialogClose();
                console.error(error);
                Alert.error('Something went wrong while creating policy');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    const onSave = (policySpecification: CreatePolicySpec) => {
        const synapseFile = synapsePolicyDefinitionFile.length !== 0 ? synapsePolicyDefinitionFile : null;
        const ccFile = ccPolicyDefinitionFile.length !== 0 ? ccPolicyDefinitionFile : null;
        savePolicy(
            policySpecification,
            synapseFile,
            ccFile,
        );
        handleDialogClose();
    };

    const importPolicy = async (data: PolicyData) => {
        try {
            // Download the YAML file
            const yamlResponse = await fetch(data.policySpecContent);
            console.log('Fetched policySpecification');
            // Different ways to handle the response body
            let yamlText = '';
            // Option 1: If body is available as a ReadableStream
            if (yamlResponse.body) {
                const reader = yamlResponse.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let done;

                // Read the stream
                while (!done) {
                    const { value, done: streamDone } = await reader!.read();
                    done = streamDone;
                    yamlText += decoder.decode(value, { stream: true });
                }
                yamlText += decoder.decode();
            }
            // Option 2: Fallback if response.text() fails but bodyUsed is false
            else if (!yamlResponse.bodyUsed) {
                try {
                    yamlText = await yamlResponse.text();
                } catch (error) {
                    console.error('Error reading response as text:', error);
                }
            }
            // Parse the YAML file to CreatePolicySpec object
            const policySpecification: CreatePolicySpec = YAML.parse(yamlText);

            // Download the .j2 file
            const j2Response = await fetch(data.synapsePolicyDefinition);
            console.log('Fetched j2File');
            const j2Blob = await j2Response.blob();
            const j2File = new File([j2Blob], 'policy.j2', { type: 'application/octet-stream' });

            // Invoke savePolicy with the parsed YAML and .j2 file
            savePolicy(policySpecification, j2File, null); // Assuming ccPolicyDefinition is not needed here
        } catch (error) {
            console.error('Error importing policy:', error);
            Alert.error('Failed to import policy');
        } finally {
            handleDialogClose();
        }
    };

    return (
        <Dialog
            maxWidth="lg"
            PaperProps={{
                style: {
                    height: '80vh',
                    padding: '24px',
                    maxWidth: '1200px', // Set a consistent max width
                },
            }}
            open={dialogOpen}
            aria-labelledby="form-dialog-title"
            onClose={handleDialogClose}
            fullWidth
        >
            <h1
                style={{
                    fontSize: '1.5rem', // Slightly larger
                    fontWeight: '600',
                    color: '#111827',
                }}
            >
                Policy Hub
            </h1>

            {/* Scrollable content container */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Responsive grid container for ProfileCards */}
                <div
                    className="cards-container"
                    style={{
                        display: 'grid',
                        gap: '2rem', // Increased gap for better vertical spacing
                        margin: '0 auto', // Center the grid
                        width: '100%',
                        justifyContent: 'center', // Center cards horizontally
                    }}
                >
                    <style>
                        {`
                    .cards-container {
                        grid-template-columns: 1fr;
                        row-gap: 2.5rem; /* Increased vertical gap */
                    }
                    @media (min-width: 768px) {
                        .cards-container {
                            grid-template-columns: repeat(2, minmax(300px, 350px));
                        }
                    }
                    @media (min-width: 1024px) {
                        .cards-container {
                            grid-template-columns: repeat(3, minmax(300px, 350px));
                        }
                    }
                `}
                    </style>

                    {data.map((cardData) => (
                        <ProfileCard
                            key={cardData.id}
                            data={cardData}
                            onImport={importPolicy}
                        />
                    ))}
                </div>
            </div>
        </Dialog>
    );
};

export default ImportPolicy;
