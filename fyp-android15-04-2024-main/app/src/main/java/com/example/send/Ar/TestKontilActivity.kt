package com.example.send.Ar

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.MotionEvent
import androidx.core.view.isGone

import com.example.send.R
import com.google.android.material.floatingactionbutton.ExtendedFloatingActionButton
import io.github.sceneview.ar.ArSceneView
import io.github.sceneview.ar.localRotation
import io.github.sceneview.ar.node.ArModelNode


class TestKontilActivity : AppCompatActivity() {

    lateinit var sceneView: ArSceneView
    lateinit var placeButton : ExtendedFloatingActionButton
    private lateinit var modelNode : ArModelNode
    private var previousX: Float = 0f

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_test_kontil)

        sceneView = findViewById(R.id.sceneView)

        placeButton = findViewById(R.id.place)

        placeButton.setOnClickListener{
            placeModel()
        }

        modelNode = ArModelNode().apply {
            loadModelGlbAsync(
                    glbFileLocation = "models/sofa.glb"
            )
            {
                sceneView.planeRenderer.isVisible = true
            }

            onAnchorChanged = {
                placeButton.isGone = true
            }

        }

        sceneView.addChild(modelNode)



    }






    private fun placeModel(){
        modelNode?.anchor()
        sceneView.planeRenderer.isVisible = false
    }



}