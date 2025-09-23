'use client'

import { useState, useEffect } from 'react'

interface AnalysisStep {
    id: string
    title: string
    icon: string
    status: 'loading' | 'completed' | 'pending'
    data?: {
        title: string
        items: Array<{
            icon: string
            title: string
            count?: string
            url?: string
        }>
        summary?: string
    }
}

interface AnalysisCardProps {
    steps: AnalysisStep[]
    response?: string
    isStreaming?: boolean
}

export default function AnalysisCard({ steps, response, isStreaming }: AnalysisCardProps) {
    // State to track if thinking steps are hidden
    const [hideThinkingSteps, setHideThinkingSteps] = useState(true)

    // Check if thinking step is completed to determine if we should collapse everything
    const thinkingStep = steps.find(step => step.id === 'thinking')
    const shouldCollapseAll = thinkingStep && thinkingStep.status === 'completed' && hideThinkingSteps

    const getIconClass = (icon: string, status: string) => {
        const baseClass = "w-4 h-5 text-center justify-center text-xs font-black"

        if (status === 'loading') {
            return `${baseClass} text-gray-800`
        } else if (status === 'completed') {
            return `${baseClass} text-gray-800`
        } else {
            return `${baseClass} text-gray-400`
        }
    }

    const getIconName = (icon: string, status: string) => {
        if (status === 'loading') {
            return 'spinner'
        }
        return icon
    }

    return (
        <div className="w-full max-w-96 flex flex-col justify-start items-start">
            {/* Analysis Steps - No gap when collapsed */}
            {steps.map((step, index) => (
                <div key={step.id} className={`self-stretch flex flex-col justify-start items-start ${!shouldCollapseAll ? 'gap-2' : ''}`}>
                    {/* Only show thinking step when collapsed, hide all others completely */}
                    {shouldCollapseAll ? (
                        // Only show thinking step with specific styling when everything is collapsed
                        step.id === 'thinking' && step.status === 'completed' && step.data && (
                            <div
                                className="self-stretch inline-flex flex-col justify-start items-start gap-1 m-0 p-0 cursor-pointer"
                                onClick={() => setHideThinkingSteps(!hideThinkingSteps)}
                            >
                                <div className="self-stretch inline-flex justify-start items-center gap-2">
                                    <div className="flex-1 flex justify-start items-center gap-2">
                                        <div className="w-4 h-5 text-center justify-center text-gray-800 text-xs font-black">
                                            <i className="fas fa-check"></i>
                                        </div>
                                        <div className="flex-1 justify-start text-gray-600 text-sm font-semibold leading-snug">
                                            {step.title}
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch inline-flex justify-start items-start gap-3.5">
                                    <div className="flex-1 pl-1.5 pr-4 flex justify-start items-start gap-3.5">
                                        <div className="w-1 self-stretch bg-gray-200 rounded-sm"></div>
                                        <div className="flex-1 py-2 flex justify-start items-start gap-3.5">
                                            <div className="flex-1 flex justify-start items-start gap-2">
                                                {step.data.summary && (() => {
                                                    const parts = step.data.summary.split(' · ')
                                                    return parts.map((part, index) => (
                                                        <div key={index} className="flex justify-start items-start gap-2">
                                                            <div className="justify-start">
                                                                <span className="text-gray-600 text-sm font-bold leading-snug">
                                                                    {part.split(' ')[0]}
                                                                </span>
                                                                <span className="text-gray-600 text-sm font-normal leading-snug">
                                                                    {' ' + part.split(' ').slice(1).join(' ')}
                                                                </span>
                                                            </div>
                                                            {index < parts.length - 1 && (
                                                                <div className="justify-start text-gray-600 text-sm font-normal leading-snug">·</div>
                                                            )}
                                                        </div>
                                                    ))
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        // Show all steps normally when not collapsed
                        <>
                            {/* Step Header */}
                            <div className="self-stretch inline-flex justify-start items-center gap-2">
                                <div className={`w-5 h-5 flex items-center justify-center ${getIconClass(step.icon, step.status)}`}>
                                    <i className={`fas fa-${getIconName(step.icon, step.status)}`}></i>
                                </div>
                                <div className="flex-1 justify-start text-gray-800 text-lg font-semibold leading-normal">
                                    {step.title}
                                </div>
                            </div>

                            {/* Step Content - Show detailed content for non-thinking steps */}
                            {step.status === 'completed' && step.data && step.id !== 'thinking' && step.data.items && (
                                <div className="self-stretch pl-1.5 pr-4 inline-flex justify-start items-start gap-3.5">
                                    <div className="w-1 self-stretch bg-khaki-150 rounded-sm"></div>
                                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                                        <div className="justify-start text-gray-600 text-sm font-semibold leading-snug">
                                            {step.data.title}
                                        </div>

                                        {/* Items List */}
                                        <div className="flex flex-col items-stretch w-full">
                                            {step.data.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="w-full">
                                                    <div className="flex w-full items-center gap-1 py-2">
                                                        <div className="flex-none w-5 h-5 flex items-center justify-center text-orange-500 text-xs">
                                                            <i className={`fas fa-${item.icon}`} />
                                                        </div>

                                                        <div className="flex-1 min-w-0 text-gray-800 text-sm leading-snug">
                                                            {item.title}
                                                        </div>

                                                        {item.count && (
                                                            <div className="shrink-0 text-right text-gray-500 text-xs leading-tight">
                                                                {item.count}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {itemIndex < (step.data?.items.length ?? 0) - 1 && (
                                                        <div className="w-full h-px bg-khaki-100" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}


        </div>
    )
}
