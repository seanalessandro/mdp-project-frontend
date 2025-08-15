"use client";

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button, Divider, Space, Select } from 'antd';
import {
    BoldOutlined, ItalicOutlined, UnderlineOutlined, UnorderedListOutlined, OrderedListOutlined
} from '@ant-design/icons';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, TextFormatType, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $isHeadingNode } from '@lexical/rich-text';
import { $isListNode, INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createParagraphNode } from 'lexical';
import { TableOutlined } from '@ant-design/icons';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import React, { useState, useEffect, useCallback } from 'react';

const blockTypeOptions = [
    { label: 'Paragraph', value: 'paragraph' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Quote', value: 'quote' },
];

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update text format state
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));

            // Update block type state
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = element.getParent();
                    // TODO: handle list type
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    setBlockType(type);
                }
            }
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload, newEditor) => {
                updateToolbar();
                return false;
            },
            1,
        );
    }, [editor, updateToolbar]);

    const formatText = (format: TextFormatType) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);

    const onBlockTypeChange = (value: string) => {
        const newBlockType = value;
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                switch (newBlockType) {
                    case 'h1':
                        $setBlocksType(selection, () => $createHeadingNode('h1'));
                        break;
                    case 'h2':
                        $setBlocksType(selection, () => $createHeadingNode('h2'));
                        break;
                    case 'quote':
                        $setBlocksType(selection, () => $createQuoteNode());
                        break;
                    default:
                        $setBlocksType(selection, () => $createParagraphNode());
                        break;
                }
            }
        });
        setBlockType(newBlockType);
    };


    return (
        <div style={{ background: '#f0f2f5', padding: '8px', borderBottom: '1px solid #ddd', marginBottom: '8px', borderRadius: '4px 4px 0 0' }}>
            <Space split={<Divider type="vertical" />}>
                <Select value={blockType} onChange={onBlockTypeChange} style={{ width: 120 }}>
                    {blockTypeOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
                    ))}
                </Select>
                <Space.Compact>
                    <Button type={isBold ? 'primary' : 'default'} icon={<BoldOutlined />} onClick={() => formatText('bold')} />
                    <Button type={isItalic ? 'primary' : 'default'} icon={<ItalicOutlined />} onClick={() => formatText('italic')} />
                    <Button type={isUnderline ? 'primary' : 'default'} icon={<UnderlineOutlined />} onClick={() => formatText('underline')} />
                </Space.Compact>
                <Space.Compact>
                    <Button icon={<UnorderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} />
                    <Button icon={<OrderedListOutlined />} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} />
                </Space.Compact>
            </Space>
        </div>
    );
}